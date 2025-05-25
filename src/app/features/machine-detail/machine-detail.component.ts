import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MachineStoreService } from '../../core/stores/machine-store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-machine-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-detail.component.html',
})
export class MachineDetailComponent implements OnInit, OnDestroy {
  private sub: Subscription | null = null;
  private machineId = '';

  constructor(
    private route: ActivatedRoute,
    private store: MachineStoreService,
    private router: Router
  ) {}

  get machine() {
    return this.store.selectedMachine;
  }

  get isLoading() {
    return this.store.isLoading;
  }

  get error() {
    return this.store.error;
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.machineId = params['id'];
      this.store.loadMachineById(this.machineId);
      this.store.connectWebSocket(this.machineId);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.store.disconnectWebSocket();
    this.store.clearSelectedMachine();
  }

  goBack() {
    this.router.navigate(['/machines']);
  }
}
