export const channelPresets = [
  {
    name: 'Feishu',
    fields: ['App ID', 'App Secret', 'Verify Token'],
    note: '优先支持飞书直连与测试发送。',
  },
  {
    name: 'Telegram',
    fields: ['Bot Token', 'Webhook URL'],
    note: '用于机器人模式快速接入。',
  },
  {
    name: 'Webhook',
    fields: ['Endpoint URL', 'Secret'],
    note: '用于自定义外部回调。',
  },
];
