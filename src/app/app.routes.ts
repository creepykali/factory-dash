import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'machines',
        pathMatch: 'full',
    },
    {
        path: 'machines',
        loadChildren: () => import('./features/machine-list/machine-list.routes').then(m => m.MACHINE_LIST_ROUTES),
    },
     {
        path: 'machines/:id',
        loadChildren: () => import('./features/machine-detail/machine-detail.routes').then(m => m.MACHINE_DETAIL_ROUTES),
    },
    
];
