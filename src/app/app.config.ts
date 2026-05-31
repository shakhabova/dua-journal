import {
    type ApplicationConfig,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
    provideLucideIcons,
    LucideHome,
    LucideBookOpen,
    LucideCheckCircle,
    LucideSun,
    LucideMoon,
    LucideLogOut,
    LucideMoreVertical,
    LucideEdit2,
    LucideRotateCcw,
    LucideTrash2,
    LucideShare2,
    LucidePlus,
    LucideSlidersHorizontal,
    LucideCheck,
    LucideAlertCircle,
    LucideMoonStar,
    LucideMessageSquare,
    LucideSend
} from '@lucide/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLucideIcons(
            LucideHome,
            LucideBookOpen,
            LucideCheckCircle,
            LucideSun,
            LucideMoon,
            LucideLogOut,
            LucideMoreVertical,
            LucideEdit2,
            LucideRotateCcw,
            LucideTrash2,
            LucideShare2,
            LucidePlus,
            LucideSlidersHorizontal,
            LucideCheck,
            LucideAlertCircle,
            LucideMoonStar,
            LucideMessageSquare,
            LucideSend
        )
    ],
};
