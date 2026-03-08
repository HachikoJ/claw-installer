import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { installSteps } from './steps';
import type { EnvironmentCheckItem } from './shared-types';
import { useInstallerStore } from './store';
import { channelPresets } from './channel-presets';
import { buildAcceptanceState, buildDiagnosisReport, testChannelConnection } from './services';

declare global {
  interface Window {
    clawInstaller?: {
      getEnvironment: () => Promise<{
        osType: string;
        osVersion: string;
        arch: string;
        homeDir: string;
        defaultInstallPath: string;
        defaultDataPath: string;
        memoryGb: number;
        cpuCount?: number;
        hasNode?: boolean;
        hasGit?: boolean;
        hasDocker?: boolean;
        cwdWritable?: boolean;
        homeWritable?: boolean;
        hasDisplay?: boolean;
        isRoot?: boolean;
      }>;
      getDashboard?: () => Promise<{
        serviceStatus: string;
        gatewayStatus: string;
        channelCount: number;
        installedSkillCount: number;
        lastStartTime: string | null;
        recentEvents: string[];
      }>;
      getLogs?: () => Promise<string[]>;
      getPlan?: () => Promise<Array<{ id: string; title: string; status: string }>>;
      runOrchestratorDemo?: () => Promise<{
        ok: boolean;
        plan: Array<{ id: string; title: string; status: string }>;
        logs: string[];
      }>;
      exportDiagnosis?: (reportText: string) => Promise<{ ok: boolean; filePath: string }>;
    };
  }
}

function App() {
  const [environment, setEnvironment] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [plan, setPlan] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  const {
    activeStep,
    installPath,
    dataPath,
    servicePort,
    accessMode,
    channelDrafts,
    diagnosisReport,
    lastExportPath,
    packVerified,
    setDraft,
    updateChannelField,
    toggleChannel,
    setChannelTestResult,
    setDiagnosisReport,
    setLastExportPath,
  } = useInstallerStore();

  useEffect(() => {
    window.clawInstaller?.getEnvironment().then((env) => {
      setEnvironment(env);
      if (!installPath) setDraft({ installPath: env.defaultInstallPath });
      if (!dataPath) setDraft({ dataPath: env.defaultDataPath });
    }).catch(() => undefined);
    window.clawInstaller?.getDashboard?.().then(setDashboard).catch(() => undefined);
    window.clawInstaller?.getLogs?.().then(setLogs).catch(() => undefined);
    window.clawInstaller?.getPlan?.().then(setPlan).catch(() => undefined);
  }, [dataPath, installPath, setDraft]);

  const runOrchestratorDemo = async () => {
    if (!window.clawInstaller?.runOrchestratorDemo) return;
    setIsRunningDemo(true);
    try {
      const result = await window.clawInstaller.runOrchestratorDemo();
      setPlan(result.plan);
      setLogs(result.logs);
      setDraft({ activeStep: 'progress' });
    } finally {
      setIsRunningDemo(false);
    }
  };

  const runDiagnosis = () => {
    const report = buildDiagnosisReport({
      osType: environment?.osType,
      osVersion: environment?.osVersion,
      arch: environment?.arch,
      memoryGb: environment?.memoryGb,
      hasNode: environment?.hasNode,
      cwdWritable: environment?.cwdWritable,
      hasDisplay: environment?.hasDisplay,
      isRoot: environment?.isRoot,
      servicePort,
    });
    setDiagnosisReport(report);
    setDraft({ activeStep: 'settings' });
  };

  const exportDiagnosis = async () => {
    if (!window.clawInstaller?.exportDiagnosis || !diagnosisReport) return;
    const result = await window.clawInstaller.exportDiagnosis(diagnosisReport);
    setLastExportPath(result.filePath);
    setLogs((prev) => [...prev, `[info] Diagnosis exported to ${result.filePath}`]);
  };

  const checks: EnvironmentCheckItem[] = useMemo(
    () => [
      { key: 'os', label: '操作系统', status: environment ? 'pass' : 'pending', detail: environment ? `${environment.osType} ${environment.osVersion} · ${environment.arch}` : '正在读取系统信息' },
      { key: 'memory', label: '内存容量', status: environment ? 'pass' : 'pending', detail: environment ? `检测到 ${environment.memoryGb} GB 内存` : '等待主进程返回信息' },
      { key: 'cpu', label: 'CPU 核心数', status: environment?.cpuCount ? 'pass' : 'pending', detail: environment ? `检测到 ${environment.cpuCount} 核 CPU` : '等待检测' },
      { key: 'node', label: 'Node 环境', status: environment?.hasNode ? 'pass' : 'warn', detail: environment ? (environment.hasNode ? 'Node runtime 可用' : 'Node 环境检查未通过') : '等待检测' },
      { key: 'git', label: 'Git 工具', status: environment?.hasGit ? 'pass' : 'warn', detail: environment ? (environment.hasGit ? 'Git 已检测到' : 'Git 未检测到') : '等待检测' },
      { key: 'docker', label: 'Docker 工具', status: environment?.hasDocker ? 'pass' : 'warn', detail: environment ? (environment.hasDocker ? 'Docker 已检测到' : 'Docker 未检测到，可后续再装') : '等待检测' },
      { key: 'permission', label: '工作目录权限', status: environment?.cwdWritable ? 'pass' : 'warn', detail: environment ? (environment.cwdWritable ? '当前工作目录可写' : '当前工作目录写权限待处理') : '等待检测' },
      { key: 'home', label: '用户目录权限', status: environment?.homeWritable ? 'pass' : 'warn', detail: environment ? (environment.homeWritable ? '用户目录可写' : '用户目录写权限待处理') : '等待检测' },
      { key: 'display', label: '图形环境', status: environment?.hasDisplay ? 'pass' : 'warn', detail: environment ? (environment.hasDisplay ? '检测到 DISPLAY / WAYLAND_DISPLAY' : '未检测到图形环境，可使用 dev:web fallback') : '等待检测' },
      { key: 'root', label: '当前权限', status: environment?.isRoot ? 'warn' : 'pass', detail: environment ? (environment.isRoot ? '当前以 root 运行，Electron 需 no-sandbox' : '当前非 root 运行') : '等待检测' },
      { key: 'path', label: '安装目录', status: installPath ? 'pass' : 'warn', detail: installPath || '尚未指定安装目录' },
      { key: 'port', label: '服务端口', status: servicePort ? 'pass' : 'warn', detail: `当前端口 ${servicePort || '未设置'}` },
    ],
    [environment, installPath, servicePort],
  );

  const acceptanceItems = useMemo(() => buildAcceptanceState({
    installPath,
    dataPath,
    diagnosisReport,
    hasPack: packVerified,
    channelDrafts,
  }), [installPath, dataPath, diagnosisReport, packVerified, channelDrafts]);

  const activeIndex = useMemo(() => installSteps.findIndex((step) => step.key === activeStep), [activeStep]);

  const nextStep = () => {
    const next = installSteps[activeIndex + 1];
    if (next) setDraft({ activeStep: next.key });
  };

  const prevStep = () => {
    const prev = installSteps[activeIndex - 1];
    if (prev) setDraft({ activeStep: prev.key });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">龙虾</div>
          <div>
            <h1>Claw Installer</h1>
            <p>跨平台一键安装部署器</p>
          </div>
        </div>
        <div className="step-list">
          {installSteps.map((step, index) => {
            const isActive = step.key === activeStep;
            const isDone = index < activeIndex;
            return (
              <button key={step.key} className={`step-card ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`} onClick={() => setDraft({ activeStep: step.key })}>
                <span className="step-index">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </span>
              </button>
            );
          })}
        </div>
        <div className="sidebar-footer">
          <strong>验收状态</strong>
          <div className="acceptance-list">
            {acceptanceItems.map((item) => (
              <div key={item.label} className={`acceptance-item ${item.ok ? 'ok' : 'todo'}`}>
                <span>{item.ok ? '✓' : '·'}</span>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>{installSteps[activeIndex]?.title ?? '安装向导'}</h2>
            <p>{installSteps[activeIndex]?.description}</p>
          </div>
          <div className="status-pill">Tonight Delivery Mode</div>
        </header>

        <section className="panel delivery-panel">
          <h3>今晚验收主路径</h3>
          <div className="delivery-grid">
            <div>
              <strong>推荐命令</strong>
              <pre>cd app{`\n`}npm install{`\n`}npm run dev:web</pre>
            </div>
            <div>
              <strong>验收顺序</strong>
              <ul>
                <li>步骤切换与草稿恢复</li>
                <li>渠道配置与连接测试 Demo</li>
                <li>诊断报告生成与导出</li>
                <li>npm run pack 打包验证</li>
              </ul>
            </div>
          </div>
        </section>

        {activeStep === 'location' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>安装目录</h3>
              <label>程序目录</label>
              <input value={installPath} onChange={(e) => setDraft({ installPath: e.target.value })} />
              <label>数据目录</label>
              <input value={dataPath} onChange={(e) => setDraft({ dataPath: e.target.value })} />
            </div>
            <div className="panel">
              <h3>目录说明</h3>
              <ul>
                <li>默认路径从 Electron 主进程按系统自动生成</li>
                <li>当前页面内容会自动保存，下次打开可以恢复</li>
                <li>下一步接入真实目录选择器和权限检测</li>
              </ul>
            </div>
          </section>
        )}

        {activeStep === 'environment' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>环境检测结果</h3>
              <div className="check-list">
                {checks.map((item) => (
                  <div key={item.key} className={`check-item ${item.status}`}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                    </div>
                    <span>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h3>诊断动作</h3>
              <p>根据当前环境信息生成一份可导出的诊断摘要，用于快速定位启动与配置问题。</p>
              <div className="channel-actions">
                <button className="inline-action" onClick={runDiagnosis}>生成诊断报告</button>
                <button className="inline-action" onClick={exportDiagnosis} disabled={!diagnosisReport}>导出报告</button>
              </div>
              <pre>{diagnosisReport || '尚未生成诊断报告'}</pre>
              {lastExportPath && <p className="success-note">最近导出：{lastExportPath}</p>}
            </div>
          </section>
        )}

        {activeStep === 'mode' && (
          <section className="panel-grid cards-3">
            {['标准安装', 'Docker 安装', '开发者安装'].map((name, index) => (
              <div key={name} className={`panel selectable ${index === 0 ? 'selected' : ''}`}>
                <h3>{name}</h3>
                <p>{index === 0 ? '推荐普通用户使用，流程最短。' : '为后续场景预留的安装模式。'}</p>
              </div>
            ))}
          </section>
        )}

        {activeStep === 'progress' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>安装计划</h3>
              <div className="progress-bar"><span style={{ width: '42%' }} /></div>
              <div className="check-list compact">
                {plan.map((item) => (
                  <div key={item.id} className={`check-item ${item.status === 'done' ? 'pass' : item.status === 'running' ? 'pending' : 'warn'}`}>
                    <div>
                      <strong>{item.title}</strong>
                    </div>
                    <span>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h3>实时日志</h3>
              <pre>{logs.join('\n')}</pre>
            </div>
          </section>
        )}

        {activeStep === 'basicConfig' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>基础配置</h3>
              <label>服务端口</label>
              <input value={servicePort} onChange={(e) => setDraft({ servicePort: e.target.value })} />
              <label>访问模式</label>
              <input value={accessMode} onChange={(e) => setDraft({ accessMode: e.target.value })} />
            </div>
            <div className="panel">
              <h3>安全默认值</h3>
              <ul>
                <li>默认仅本地访问</li>
                <li>默认启用更安全配置</li>
                <li>下一步接入真实配置生成器与权限收紧逻辑</li>
              </ul>
            </div>
          </section>
        )}

        {activeStep === 'channels' && (
          <section className="panel-grid cards-3">
            {channelPresets.map((item) => {
              const draft = channelDrafts[item.name];
              return (
                <div key={item.name} className="panel selectable">
                  <div className="toggle-row">
                    <h3>{item.name}</h3>
                    <label className="switch-row">
                      <input
                        type="checkbox"
                        checked={draft?.enabled ?? false}
                        onChange={(e) => toggleChannel(item.name, e.target.checked)}
                      />
                      <span>{draft?.enabled ? '已启用' : '未启用'}</span>
                    </label>
                  </div>
                  <p>{item.note}</p>
                  {item.fields.map((field) => (
                    <div key={field}>
                      <label>{field}</label>
                      <input
                        value={draft?.fields?.[field] ?? ''}
                        onChange={(e) => updateChannelField(item.name, field, e.target.value)}
                        placeholder={`请输入 ${field}`}
                      />
                    </div>
                  ))}
                  <div className="channel-actions">
                    <button
                      className="inline-action"
                      onClick={() => setChannelTestResult(item.name, testChannelConnection(item.name, draft))}
                    >
                      测试连接
                    </button>
                    <span className={`test-result ${draft?.lastTestResult ?? 'idle'}`}>
                      {draft?.lastTestResult === 'success' && '连接成功'}
                      {draft?.lastTestResult === 'failed' && '连接失败'}
                      {draft?.lastTestResult === 'testing' && '信息不完整，待补全'}
                      {(!draft?.lastTestResult || draft?.lastTestResult === 'idle') && '尚未测试'}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {activeStep === 'done' && (
          <section className="panel-grid two-col">
            <div className="panel done-panel">
              <h3>桌面基础层已打通</h3>
              <p>当前已完成前端壳、Electron 主进程、IPC 桥接、真实环境信息读取和安装草稿持久化。</p>
            </div>
            <div className="panel">
              <h3>下一步</h3>
              <ul>
                <li>切到控制台查看运行壳</li>
                <li>继续补安装编排和日志服务</li>
              </ul>
              <button className="inline-action" onClick={runOrchestratorDemo} disabled={isRunningDemo}>
                {isRunningDemo ? '运行中...' : '运行编排 Demo'}
              </button>
            </div>
          </section>
        )}

        {activeStep === 'dashboard' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>控制台总览</h3>
              <div className="metric-row"><strong>服务状态</strong><span>{dashboard?.serviceStatus ?? 'loading'}</span></div>
              <div className="metric-row"><strong>网关状态</strong><span>{dashboard?.gatewayStatus ?? 'loading'}</span></div>
              <div className="metric-row"><strong>渠道数量</strong><span>{dashboard?.channelCount ?? '-'}</span></div>
              <div className="metric-row"><strong>技能数量</strong><span>{dashboard?.installedSkillCount ?? '-'}</span></div>
            </div>
            <div className="panel">
              <h3>近期事件</h3>
              <ul>
                {(dashboard?.recentEvents ?? []).map((event: string) => <li key={event}>{event}</li>)}
              </ul>
            </div>
          </section>
        )}

        {activeStep === 'settings' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>设置壳</h3>
              <ul>
                <li>通用设置</li>
                <li>网络设置</li>
                <li>安全设置</li>
                <li>日志设置</li>
              </ul>
            </div>
            <div className="panel">
              <h3>诊断报告</h3>
              <pre>{diagnosisReport || '尚未生成诊断报告'}</pre>
              {lastExportPath && <p className="success-note">最近导出：{lastExportPath}</p>}
            </div>
          </section>
        )}

        <footer className="footer-actions">
          <button onClick={prevStep} disabled={activeIndex === 0}>上一步</button>
          <button className="primary" onClick={nextStep} disabled={activeIndex === installSteps.length - 1}>下一步</button>
        </footer>
      </main>
    </div>
  );
}

export default App;
