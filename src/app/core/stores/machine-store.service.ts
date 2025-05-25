import { Injectable, computed, signal } from '@angular/core';
import { Machine } from '../../shared/models/machine.model';
import { MachineApiService } from '../services/machine-api.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { catchError, finalize, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MachineStoreService {
  private _machines = signal<Machine[]>([]);
  private _selectedMachine = signal<Machine | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _totalCount = signal(0);
  private _params = signal({ page: 1, pageSize: 10, search: '' });

  private hubConnection: HubConnection | null = null;

  machines = this._machines.asReadonly();
  selectedMachine = this._selectedMachine.asReadonly();
  isLoading = this._isLoading.asReadonly();
  error = this._error.asReadonly();
  listParams = this._params.asReadonly();
  totalCount = this._totalCount.asReadonly();

  filteredMachines = computed(() => {
    const machines = this._machines();
    const search = this._params().search.toLowerCase();
    return search
      ? machines.filter(m => m.name.toLowerCase().includes(search))
      : machines;
  });

  constructor(private api: MachineApiService) {
    this.loadMachineList();
  }

  loadMachineList() {
    const { page, pageSize, search } = this._params();
    this._isLoading.set(true);
    this.api.fetchMachines({ page, pageSize, search })
      .pipe(
        tap(data => this._machines.set(data)),
        catchError(err => {
          this._error.set(err.message);
          return of([]);
        }),
        finalize(() => this._isLoading.set(false))
      ).subscribe();
  }

  loadMachineById(id: string) {
    this._isLoading.set(true);
    this.api.fetchMachineById(id)
      .pipe(
        tap(m => this._selectedMachine.set(m)),
        catchError(err => {
          this._error.set(err.message);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      ).subscribe();
  }

  connectWebSocket(machineId: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://ng-demo-api.opten.io/hubs/machines')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveUpdate', (update: Machine) => {
      if (update.id === machineId) {
        this._selectedMachine.set(update);
      }
    });

    this.hubConnection.start().catch(console.error);
  }

  disconnectWebSocket() {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  deleteMachine(id: string) {
    this.api.deleteMachine(id).subscribe(() => {
      this._machines.set(this._machines().filter(m => m.id !== id));
    });
  }

  setSearch(search: string) {
    this._params.update(p => ({ ...p, search }));
    this.loadMachineList();
  }

  setPage(page: number) {
    this._params.update(p => ({ ...p, page }));
    this.loadMachineList();
  }

  clearSelectedMachine() {
    this._selectedMachine.set(null);
  }

}
