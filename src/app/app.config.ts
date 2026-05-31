import {
    type ApplicationConfig,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
    LucideBookOpen,
    LucideCheck,
    LucideCircleAlert,
    LucideCircleCheckBig,
    LucideEllipsisVertical,
    LucideHouse,
    LucideLogOut,
    LucideMessageSquare,
    LucideMoon,
    LucideMoonStar,
    LucidePen,
    LucidePlus,
    LucideRotateCcw,
    LucideSend,
    LucideShare2,
    LucideSlidersHorizontal,
    LucideSun,
    LucideTrash2,
    provideLucideIcons,
} from '@lucide/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLucideIcons(
            LucideHouse,
            LucideBookOpen,
            LucideCircleCheckBig,
            LucideSun,
            LucideMoon,
            LucideLogOut,
            LucideEllipsisVertical,
            LucidePen,
            LucideRotateCcw,
            LucideTrash2,
            LucideShare2,
            LucidePlus,
            LucideSlidersHorizontal,
            LucideCheck,
            LucideCircleAlert,
            LucideMoonStar,
            LucideMessageSquare,
            LucideSend,
        ),
    ],
};
