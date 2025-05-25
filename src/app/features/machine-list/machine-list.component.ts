import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachineStoreService } from '../../core/stores/machine-store.service';
import { Router } from '@angular/router';
import type { Machine } from '../../shared/models/machine.model';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-list.component.html',
})
export class MachineListComponent {
  constructor(
    private store: MachineStoreService,
    private router: Router
  ) {}

  get machines() {
    return this.store.filteredMachines;
  }

  get isLoading() {
    return this.store.isLoading;
  }

  get error() {
    return this.store.error;
  }

  get page() {
    return this.store.listParams().page;
  }

  get pageSize() {
    return this.store.listParams().pageSize;
  }

  get totalCount() {
    return this.store.totalCount();
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.store.setSearch(input.value);
  }

  onPageChange(page: number) {
    this.store.setPage(page);
  }

  goToDetail(id: string) {
    this.router.navigate(['/machines', id]);
  }

  delete(id: string) {
    if (confirm('Delete this machine?')) {
      this.store.deleteMachine(id);
    }
  }

  trackByMachine(index: number, machine: Machine) {
    return machine.id;
  }
}
