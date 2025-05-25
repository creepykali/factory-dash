import { Injectable, Signal, computed, effect, signal } from '@angular/core';
import { finalize, catchError, of, tap } from 'rxjs';
import { MachineApiService } from '../services/machine-api.service';
import type { Machine } from '../../shared/models/machine.model';

interface MachineListParams {
  page: number;
  pageSize: number;
  search: string;
}

@Injectable({ providedIn: 'root' })
export class MachineStore {
  // ─── Private signals ──────────────────────────────
  private readonly _machines = signal<Machine[]>([]);
  private readonly _selectedMachine = signal<Machine | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _totalCount = signal(0);

  private readonly _listParams = signal<MachineListParams>({
    page: 1,
    pageSize: 10,
    search: '',
  });

  // ─── Public readonly signals ───────────────────────
  readonly machines = this._machines.asReadonly();
  readonly selectedMachine = this._selectedMachine.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly listParams = this._listParams.asReadonly();

  // ─── Computed selectors ────────────────────────────
  readonly filteredMachines = computed(() => {
    const list = this._machines();
    const { search } = this._listParams();
    return search
      ? list.filter(m =>
          m.name.toLowerCase().includes(search.toLowerCase())
        )
      : list;
  });

  readonly totalPages = computed(() => {
    const total = this._totalCount();
    const size = this._listParams().pageSize;
    return Math.ceil(total / size);
  });

  readonly hasErrors = computed(() => {
    return this._machines().some(m => m.status === 'Error');
  });

  // ─── Constructor ───────────────────────────────────
  constructor(private api: MachineApiService) {
    // Auto-refresh list when params change
    effect(() => {
      const params = this._listParams();
      this.loadMachineList(params);
    });
  }

  // ─── Load all machines with optional override params ─
  loadMachineList(params?: Partial<MachineListParams>) {
    const mergedParams = { ...this._listParams(), ...params };
    this._listParams.set(mergedParams);
    this._isLoading.set(true);
    this._error.set(null);

    this.api
      .fetchMachines(mergedParams)
      .pipe(
        tap((machines: Machine[]) => {
          this._machines.set(machines);
          // TODO: Set total count if available from API
        }),
        catchError(err => {
          this._error.set(`Failed to load machines: ${err.message}`);
          return of([]);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // ─── Load a specific machine ───────────────────────
  loadMachineById(id: string) {
    this._isLoading.set(true);
    this._error.set(null);

    this.api
      .fetchMachineById(id)
      .pipe(
        tap(machine => this._selectedMachine.set(machine)),
        catchError(err => {
          this._error.set(`Failed to load machine: ${err.message}`);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // ─── Create or update a machine ────────────────────
  saveMachine(data: Partial<Machine>, id?: string) {
    this._isLoading.set(true);
    this._error.set(null);

    const request$ = id
      ? this.api.updateMachine(id, data)
      : this.api.createMachine(data);

    request$
      .pipe(
        tap((saved: Machine) => {
          const current = this._machines();
          if (id) {
            this._machines.set(current.map(m => (m.id === saved.id ? saved : m)));
          } else {
            this._machines.set([saved, ...current]);
          }
        }),
        catchError(err => {
          this._error.set(`Save failed: ${err.message}`);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // ─── Delete a machine ──────────────────────────────
  deleteMachine(id: string) {
    this._isLoading.set(true);
    this._error.set(null);

    this.api
      .deleteMachine(id)
      .pipe(
        tap(() => {
          const updated = this._machines().filter(m => m.id !== id);
          this._machines.set(updated);
        }),
        catchError(err => {
          this._error.set(`Delete failed: ${err.message}`);
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  // ─── Clear selected machine (on component destroy) ─
  clearSelectedMachine() {
    this._selectedMachine.set(null);
  }

  // ─── List param helpers ────────────────────────────
  setSearch(search: string) {
    this._listParams.update(p => ({ ...p, search }));
  }

  setPage(page: number) {
    this._listParams.update(p => ({ ...p, page }));
  }

  setPageSize(pageSize: number) {
    this._listParams.update(p => ({ ...p, pageSize }));
  }
}
