// AI配置接口验证
const validateConfig = async ({ apiKey, baseUrl, model }) => {
  if (!apiKey || !baseUrl || !model) {
    alert('请填写完整的AI配置');
    return false;
  }
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      alert('配置验证失败，请检查API Key和Base URL');
      return false;
    }
    const data = await response.json();
    // 检查模型是否存在
    const models = data.data?.map(item => item.id) || [];
    if (!models.includes(model)) {
      alert(`模型 "${model}" 不存在或无权限，请检查模型名称`);
      return false;
    }
    alert('配置验证成功');
    return true;
  } catch (error) {
    alert('配置验证异常: ' + error.message);
    return false;
  }
};

export default validateConfig;