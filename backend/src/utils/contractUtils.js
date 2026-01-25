export const generateContractHtml = (templateContent, data) => {
    let html = templateContent;
    const now = new Date();

    // Default values if data checks fail
    const safeData = {
        contract_no: data.contract_no || `CT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-PREVIEW`,
        created_at: data.created_at || now.toLocaleDateString('zh-CN'),
        party_a_name: data.party_a_name || '______________',
        party_a_phone: data.party_a_phone || '______________',
        party_b_name: data.party_b_name || '______________',
        party_b_phone: data.party_b_phone || '______________',
        project_name: data.project_name || '______________',
        service_address: data.service_address || '______________',
        total_amount: data.total_amount || '0.00'
    };

    // Replace all variables
    const variables = [
        'contract_no',
        'created_at',
        'party_a_name',
        'party_a_phone',
        'party_b_name',
        'party_b_phone',
        'project_name',
        'service_address',
        'total_amount'
    ];

    variables.forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, safeData[key]);
    });

    return html;
};
