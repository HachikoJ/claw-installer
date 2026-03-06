import { useMemo, useState } from 'react';
import './App.css';
import { installSteps } from './steps';
import type { EnvironmentCheckItem, InstallStepKey } from './shared-types';

const checks: EnvironmentCheckItem[] = [
  { key: 'os', label: '操作系统', status: 'pass', detail: '已检测当前系统与架构' },
  { key: 'network', label: '网络连接', status: 'pass', detail: '网络连接正常，可继续下载资源' },
  { key: 'permission', label: '写入权限', status: 'warn', detail: '当前目录需在安装时再次确认写入权限' },
  { key: 'dependency', label: '依赖环境', status: 'pending', detail: '后续接入真实环境检测服务' },
];

function App() {
  const [activeStep, setActiveStep] = useState<InstallStepKey>('location');
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
          <div className="status-pill">MVP Scaffold</div>
        </header>

        {activeStep === 'location' && (
          <section className="panel-grid two-col">
            <div className="panel">
              <h3>安装目录</h3>
              <label>程序目录</label>
              <input value="C:\\Users\\User\\openclaw" readOnly />
              <label>数据目录</label>
              <input value="C:\\Users\\User\\openclaw\\data" readOnly />
            </div>
            <div className="panel">
              <h3>目录说明</h3>
              <ul>
                <li>默认使用用户目录，避免系统路径权限问题</li>
                <li>后续支持 macOS / Linux 自动给出对应默认路径</li>
                <li>真实路径检测与浏览器选择器将在下一阶段接入</li>
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
              <pre>[info] scaffolding installer flow
[info] platform adapter pending
[info] real orchestration will connect next
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
                <li>后续接入真实配置生成器</li>
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
              <h3>安装流程骨架完成</h3>
              <p>当前已进入可持续开发阶段，接下来接入真实 Electron 主进程、环境检测和安装执行引擎。</p>
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
