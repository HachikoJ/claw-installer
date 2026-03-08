export interface ChannelPreset {
  name: string;
  fields: string[];
  note: string;
}

export const channelPresets: ChannelPreset[] = [
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

export const defaultChannelDrafts = Object.fromEntries(
  channelPresets.map((preset) => [
    preset.name,
    {
      enabled: preset.name === 'Feishu',
      fields: Object.fromEntries(preset.fields.map((field) => [field, ''])),
      lastTestResult: 'idle',
    },
  ]),
);
