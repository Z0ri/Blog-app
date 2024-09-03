import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LogOutComponent } from '../dialogs/log-out/log-out.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  readonly dialog = inject(MatDialog);
  constructor(){}

  confirmLogout(){
    this.dialog.open(LogOutComponent);
  }
}
