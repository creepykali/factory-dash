import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Machine } from '../../shared/models/machine.model';

@Injectable({ providedIn: 'root' })
export class MachineApiService {
  private readonly baseUrl = 'http://ng-demo-api.opten.io/api/machines';

  constructor(private http: HttpClient) {}

  fetchMachines(params?: { page?: number; pageSize?: number; search?: string }): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.baseUrl, { params: { ...(<any>params) } });
  }

  fetchMachineById(id: string): Observable<Machine> {
    return this.http.get<Machine>(`${this.baseUrl}/${id}`);
  }

  createMachine(payload: Partial<Machine>): Observable<Machine> {
    return this.http.post<Machine>(this.baseUrl, payload);
  }

  updateMachine(id: string, payload: Partial<Machine>): Observable<Machine> {
    return this.http.put<Machine>(`${this.baseUrl}/${id}`, payload);
  }

  deleteMachine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
