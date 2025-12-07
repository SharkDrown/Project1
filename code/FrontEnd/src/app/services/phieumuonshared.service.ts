import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class PhieuMuonSharedService { 
  
  
  private phieuMuonCreatedSource = new Subject<void>();

 
  phieuMuonCreated$ = this.phieuMuonCreatedSource.asObservable();

  constructor() { }

 
  notifyPhieuMuonCreated() {
    this.phieuMuonCreatedSource.next();
  }
}