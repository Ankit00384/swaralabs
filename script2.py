import json
d = json.load(open('sarvam_docs.json', encoding='utf-8'))
for k in ['SpeechToTextResponse', 'DocDigitizationCreateJobResponse', 'DocDigitizationUploadFilesResponse', 'DocDigitizationStartJobResponse', 'DocDigitizationJobStatusResponse', 'DocDigitizationDownloadContentResponse']:
    schema = d['components']['schemas'].get(k)
    print(f'{k}: {schema.get("properties") if schema else "Not found"}')
