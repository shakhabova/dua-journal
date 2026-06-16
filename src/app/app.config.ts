import {
    type ApplicationConfig,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
    LucideArchive,
    LucideBookOpen,
    LucideCheck,
    LucideCircleAlert,
    LucideCircleCheckBig,
    LucideEllipsisVertical,
    LucideHouse,
    LucideLibrary,
    LucideLogOut,
    LucideMessageSquare,
    LucideMoon,
    LucideMoonStar,
    LucidePen,
    LucidePlus,
    LucideRotateCcw,
    LucideSearch,
    LucideSend,
    LucideShare2,
    LucideSlidersHorizontal,
    LucideSun,
    LucideTrash2,
    LucideX,
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
            LucideLibrary,
            LucideSearch,
            LucideX,
            LucideArchive,
        ),
    ],
};
