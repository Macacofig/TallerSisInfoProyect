import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIDEBAR_MESSAGES } from '../../app/strings/layout/sidebar.messages';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly SIDEBAR_MESSAGES = SIDEBAR_MESSAGES;
}
