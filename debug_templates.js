
const fetch = require('node-fetch');

async function test() {
    try {
        // Need to login first to get token if endpoint is protected, or use published endpoint which is public
        const response = await fetch('http://localhost:3001/api/form-templates/published');
        const data = await response.json();

        console.log('Published Templates:', JSON.stringify(data.templates, null, 2));

        if (data.templates && data.templates.length > 0) {
            console.log('First template steps:', JSON.stringify(data.templates[0].steps, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

test();
