import json
d = json.load(open('sarvam_docs.json', encoding='utf-8'))
for k in ['DocDigitizationCreateJobResponse', 'DocDigitizationUploadFilesResponse', 'DocDigitizationJobStatusResponse', 'DocDigitizationDownloadFilesResponse']:
    print(k, json.dumps(d['components']['schemas'].get(k, {}).get('properties', {}), indent=2))
