import type { StepItem } from './shared-types';

export const installSteps: StepItem[] = [
  { key: 'location', title: '安装位置', description: '选择程序与数据目录' },
  { key: 'environment', title: '环境检测', description: '检查系统、网络与依赖' },
  { key: 'mode', title: '安装方式', description: '选择标准或高级安装方式' },
  { key: 'progress', title: '安装执行', description: '执行部署并查看实时日志' },
  { key: 'basicConfig', title: '基础配置', description: '生成初始运行配置' },
  { key: 'channels', title: '接入配置', description: '连接飞书、Telegram 等渠道' },
  { key: 'done', title: '完成', description: '查看结果并进入控制台' },
];
