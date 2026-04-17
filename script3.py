import json
d = json.load(open('sarvam_docs.json', encoding='utf-8'))
for path in ['/doc-digitization/job/v1', '/doc-digitization/job/v1/upload-files', '/doc-digitization/job/v1/{job_id}/start', '/doc-digitization/job/v1/{job_id}/status', '/doc-digitization/job/v1/{job_id}/download-files']:
    for method in d['paths'][path]:
        resp = d['paths'][path][method]['responses'].get('200') or d['paths'][path][method]['responses'].get('202')
        print(f'{path} {method.upper()} Response: {json.dumps(resp)[:500]}')
