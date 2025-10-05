import { Request, Response } from 'express';
export declare function healthCheck(req: Request, res: Response): Promise<void>;
export declare function readiness(req: Request, res: Response): Promise<void>;
export declare function liveness(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=health.d.ts.map