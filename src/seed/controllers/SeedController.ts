

import {
  Controller,
  Get,
  Post,
  Inject,
} from "../../config/decorators";


import { Request, Response } from "express";
import { SeedService } from "../services/SeedService";

@Controller("/seed")
export class SeedController {
    constructor(@Inject() private seedService: SeedService) {}

    @Post("/run")
    async seedDatabase(req: Request, res: Response): Promise<void> {
        try {
            await this.seedService.seedDatabase();
            res.status(200).json({ message: 'Database seeded successfully' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ 
                error: 'Failed to seed database',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    @Get('/status')
    async getDatabaseStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = await this.seedService.getDatabaseStatus();
            res.status(200).json(status);
        } catch (error) {
            res.status(500).json({ 
                error: 'Failed to get database status',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

}
