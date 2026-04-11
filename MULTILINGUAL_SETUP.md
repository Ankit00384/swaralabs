# Multilingual TTS Implementation Guide

Your project is now set up for multilingual Text-to-Speech generation with support for Japanese and the top 5 Indian languages.

## Supported Languages

| Language | Code | Native Name | Locale |
|----------|------|-------------|--------|
| Japanese | `ja` | 日本語 | ja-JP |
| Hindi | `hi` | हिन्दी | hi-IN |
| Bengali | `bn` | বাংলা | bn-IN |
| Telugu | `te` | తెలుగు | te-IN |
| Marathi | `mr` | मराठी | mr-IN |
| Tamil | `ta` | தమిழ் | ta-IN |

## Files Modified/Created

### Frontend Components

1. **`src/lib/languages.ts`** (NEW)
   - Central configuration for all supported languages
   - Helper functions: `getLanguageName()`, `getLanguageNativeName()`, `getLanguageCode()`
   - Exports `SUPPORTED_LANGUAGES`, `LANGUAGE_LIST`, and `LanguageCode` type

2. **`src/features/text-to-speech/components/language-selector.tsx`** (NEW)
   - React component for language selection dropdown
   - Displays native language names with flags
   - Integrated into the settings panel

3. **`src/features/text-to-speech/components/settings-panel-settings.tsx`** (UPDATED)
   - Added language selector section above voice selector
   - Language field is now part of the TTS form

### Form & API

4. **`src/features/text-to-speech/components/text-to-speech-form.tsx`** (UPDATED)
   - Updated Zod schema to include `language` field
   - Default language set to Japanese (`ja`)
   - Language passed to TRPC mutation

5. **`src/app/api/tts-generate-chunked/route.ts`** (UPDATED)
   - Accepts `language` parameter from request
   - Converts language code to locale format (e.g., `ja` → `ja-JP`)
   - Passes language to audio generation function

6. **`src/lib/generate-chunked-audio.ts`** (UPDATED)
   - `GenerateChunkedAudioParams` type now includes optional `language` field
   - Language parameter passed to Chatterbox API for each chunk

7. **`src/trpc/routers/generations.ts`** (UPDATED)
   - Input schema includes `language` field with default value `"ja"`
   - Language passed through to chunked and single-pass generation
   - Language stored in database when generation is saved

### Backend

8. **`chatterbox_tts.py`** (UPDATED)
   - `TTSRequest` model now accepts `language` parameter
   - Language parameter extracted and converted to language code
   - Passed to model's `generate()` method
   - Supports: `ja-JP`, `hi-IN`, `bn-IN`, `te-IN`, `mr-IN`, `ta-IN`

### Database

9. **`prisma/schema.prisma`** (UPDATED)
   - Added `language` field to `Generation` model
   - Default value: `"ja"`
   - New migration created: `add_language_field_to_generation`

## How It Works

### User Flow

1. User opens the Text-to-Speech page
2. In the Settings panel, they see the **Language** dropdown at the top
3. User selects their desired language (Japanese, Hindi, Bengali, etc.)
4. User enters text in the selected language
5. User selects a voice and clicks "Generate"
6. The selected language is sent to the backend along with the voice and text

### Backend Processing

1. Next.js API route (`/api/tts-generate-chunked`) receives the request
2. Language code is converted from short form (e.g., `ja`) to locale form (e.g., `ja-JP`)
3. For long text: split into chunks, each chunk is sent with the language to Chatterbox
4. For short text: sent directly with the language
5. Chatterbox TTS model uses the language to generate speech in the correct language
6. Generation record stored in database with language metadata

## Usage in Code

### Reading Language Configuration

```typescript
import { SUPPORTED_LANGUAGES, LANGUAGE_LIST, getLanguageName } from '@/lib/languages';

// Get all supported languages
LANGUAGE_LIST.forEach(lang => {
  console.log(`${lang.flag} ${lang.nativeName} (${lang.name})`);
});

// Get specific language info
const language = SUPPORTED_LANGUAGES.hi;
console.log(language.nativeName); // हिन्दी
console.log(language.code); // hi-IN
```

### Using Language Selector Component

```tsx
import { LanguageSelector } from '@/features/text-to-speech/components/language-selector';
import { type LanguageCode } from '@/lib/languages';

function MyComponent() {
  const [language, setLanguage] = useState<LanguageCode>('ja');

  return (
    <LanguageSelector 
      value={language} 
      onValueChange={setLanguage}
      disabled={isLoading}
    />
  );
}
```

## Extending to More Languages

To add more languages:

1. Update `SUPPORTED_LANGUAGES` in `src/lib/languages.ts`:
   ```typescript
   export const SUPPORTED_LANGUAGES = {
     // ... existing languages
     es: {
       name: "Spanish",
       nativeName: "Español",
       code: "es-ES",
       flag: "🇪🇸",
     },
   } as const;
   ```

2. Ensure your Chatterbox TTS model supports the language/locale

3. Update the database migration if needed

4. The language selector will automatically pick up the new language

## Chatterbox TTS Model Requirements

For the multilingual feature to work properly, ensure your Chatterbox TTS model:

- Supports the language codes you're using (ja, hi, bn, te, mr, ta)
- Can accept a `language` parameter in its `generate()` method
- Can handle language-specific pronunciation and speech characteristics

If using Chatterbox with Meta MMS or similar multilingual models, the language parameter will be used to guide speech generation in the correct language.

## Testing

To test the multilingual implementation:

1. Select different languages from the dropdown
2. Enter text in the selected language
3. Generate audio - verify that it's spoken in the correct language
4. Check the database - verify that the `language` field is saved correctly

## Notes

- Default language is Japanese (`ja`)
- Language selection is optional - if not specified, defaults to Japanese
- The language parameter is passed through all layers (frontend → API → database → TTS backend)
- Language metadata is persisted in the database for future reference and analytics
