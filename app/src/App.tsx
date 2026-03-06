import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { installSteps } from './steps';
import type { EnvironmentCheckItem, InstallStepKey } from './shared-types';

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
      }>;
    };
  }
}

function App() {
  const [activeStep, setActiveStep] = useState<InstallStepKey>('location');
  const [environment, setEnvironment] = useState<null | {
    osType: string;
    osVersion: string;
    arch: string;
    homeDir: string;
    defaultInstallPath: string;
    defaultDataPath: string;
    memoryGb: number;
  }>(null);

  useEffect(() => {
    window.clawInstaller?.getEnvironment().then(setEnvironment).catch(() => undefined);
  }, []);

  const checks: EnvironmentCheckItem[] = useMemo(
    () => [
      {
        key: 'os',
        label: '操作系统',
        status: environment ? 'pass' : 'pending',
        detail: environment
          ? `${environment.osType} ${environment.osVersion} · ${environment.arch}`
          : '正在读取系统信息',
      },
      {
        key: 'memory',
        label: '内存容量',
        status: environment ? 'pass' : 'pending',
        detail: environment ? `检测到 ${environment.memoryGb} GB 内存` : '等待主进程返回信息',
      },
      {
        key: 'network',
        label: '网络连接',
        status: 'warn',
        detail: '网络连通检测将在下一步接入真实检测服务',
      },
      {
        key: 'dependency',
        label: '依赖环境',
        status: 'pending',
        detail: '后续接入 Node / Docker / Git 等真实检测项',
      },
    ],
    [environment],
  );

  const activeIndex = useMemo(
    () => installSteps.findIndex((step) => step.key === activeStep),
    [activeStep],
  );

  const nextStep = () => {
    const next = installSteps[activeIndex + 1];
    if (next) setActiveStep(next.key);
  };

  const prevStep = () => {
    const prev = installSteps[activeIndex - 1];
    if (prev) setActiveStep(prev.key);
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
              <button
                key={step.key}
                className={`step-card ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => setActiveStep(step.key)}
              >
                <span className="step-index">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>{installSteps[activeIndex]?.title ?? '安装向导'}</h2>
            <p>{installSteps[activeIndex]?.description}</p>
          </div>
          <div className="status-pill">Desktop Foundation</div>
        </header>

        {activeStep === 'location' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>安装目录</h3>
              <label>程序目录</label>
              <input value={environment?.defaultInstallPath ?? '读取中...'} readOnly />
              <label>数据目录</label>
              <input value={environment?.defaultDataPath ?? '读取中...'} readOnly />
            </div>
            <div className="panel">
              <h3>目录说明</h3>
              <ul>
                <li>默认使用当前用户主目录，降低权限问题</li>
                <li>已通过 Electron 主进程按当前系统生成默认路径</li>
                <li>下一步接入真实目录选择器和权限检测</li>
              </ul>
            </div>
          </section>
        )}

        {activeStep === 'environment' && (
          <section className="panel-grid">
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
              <h3>安装进度</h3>
              <div className="progress-bar"><span style={{ width: '42%' }} /></div>
              <ul>
                <li>创建目录</li>
                <li>下载核心资源</li>
                <li>生成配置文件</li>
                <li>启动服务</li>
              </ul>
            </div>
            <div className="panel">
              <h3>实时日志</h3>
              <pre>[info] electron main process wired
[info] preload bridge ready
[info] real env data connected
</pre>
            </div>
          </section>
        )}

        {activeStep === 'basicConfig' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>基础配置</h3>
              <label>服务端口</label>
              <input value="18789" readOnly />
              <label>访问模式</label>
              <input value="local_only" readOnly />
            </div>
            <div className="panel">
              <h3>安全默认值</h3>
              <ul>
                <li>默认仅本地访问</li>
                <li>默认启用更安全配置</li>
                <li>后续接入真实配置生成器与权限收紧逻辑</li>
              </ul>
            </div>
          </section>
        )}

        {activeStep === 'channels' && (
          <section className="panel-grid cards-3">
            {['Feishu', 'Telegram', 'Webhook'].map((name) => (
              <div key={name} className="panel selectable">
                <h3>{name}</h3>
                <p>渠道配置表单与测试连接能力将在下一阶段接入。</p>
              </div>
            ))}
          </section>
        )}

        {activeStep === 'done' && (
          <section className="panel-grid">
            <div className="panel done-panel">
              <h3>桌面基础层已打通</h3>
              <p>当前已完成前端壳、Electron 主进程、IPC 桥接和真实环境信息读取，下一步进入安装编排与持久化。</p>
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
