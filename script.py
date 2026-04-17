import json

def get_endpoint(path, data):
    for method, info in data.items():
        print(f'Endpoint: https://api.sarvam.ai{path} ({method.upper()})')
        print('Headers:', info.get('parameters', []))
        if 'requestBody' in info:
            print('Request Body:', json.dumps(info['requestBody'], indent=2)[:500])
        print('Response:', list(info.get('responses', {}).keys()))
        print('---')

d = json.load(open('sarvam_docs.json', encoding='utf-8'))
get_endpoint('/speech-to-text', d['paths']['/speech-to-text'])
print('\n\n--- OCR ---')
for path in d['paths']:
    if '/doc-digitization' in path:
        get_endpoint(path, d['paths'][path])
