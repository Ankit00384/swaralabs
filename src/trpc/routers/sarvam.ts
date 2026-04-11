import { orgProcedure, createTRPCRouter } from "../init";
import { listSarvamPronunciationDictionaries } from "@/lib/tts/sarvam";

export const sarvamRouter = createTRPCRouter({
  listPronunciationDictionaries: orgProcedure.query(async () => {
    return listSarvamPronunciationDictionaries();
  }),
});
