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
    if (response.ok) {
      alert('配置验证成功');
      return true;
    } else {
      alert('配置验证失败，请检查API Key和Base URL');
      return false;
    }
  } catch (error) {
    alert('配置验证异常: ' + error.message);
    return false;
  }
};

export default validateConfig;