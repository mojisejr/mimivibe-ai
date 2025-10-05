import { Worker } from 'bullmq';
import { TarotReadingJob, TarotReadingJobResult } from '../../../shared/types/queue';
declare const tarotWorker: Worker<TarotReadingJob, TarotReadingJobResult, string>;
export default tarotWorker;
//# sourceMappingURL=tarot-worker.d.ts.map