const ConfigModal = ({
    visible,
    onClose,
    baseUrl,
    setBaseUrl,
    apiKey,
    setApiKey,
    model,
    setModel,
    prompt,
    setPrompt,
    validateConfig,
    DEFAULT_PROMPT
}) => {
    if (!visible) return null;
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                padding: '32px',
                minWidth: '400px',
                maxWidth: '90vw',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'none',
                        border: 'none',
                        fontSize: 22,
                        cursor: 'pointer',
                        color: '#888'
                    }}
                    aria-label="关闭"
                >×</button>
                <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#374151', marginBottom: '18px' }}>AI配置</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            Base URL
                        </label>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
                            placeholder="例如: https://api.example.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
                            placeholder="输入API密钥"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            模型名称
                        </label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' }}
                            placeholder="例如: gpt-4-vision-preview"
                        />
                    </div>
                </div>
                <div style={{ marginTop: '16px', position: 'relative' }}>
                    <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        提示词 (Markdown格式)
                    </label>
                    <button
                        onClick={() => setPrompt(DEFAULT_PROMPT)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '4px 10px',
                            fontSize: '13px',
                            background: '#e5e7eb',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#374151',
                            cursor: 'pointer'
                        }}
                        title="重置为默认提示词"
                    >
                        使用默认
                    </button>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px', marginTop: '6px', fontFamily: 'monospace' }}
                        placeholder={DEFAULT_PROMPT}
                        rows="10"
                    />
                </div>
                <button
                    onClick={async () => await validateConfig()}
                    style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    验证配置
                </button>
            </div>
        </div>
    );
};

export default ConfigModal;