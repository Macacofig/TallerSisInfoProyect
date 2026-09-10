import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LAYOUT_STRINGS as LAYOUT_TEXTS } from '../../app/strings/layout.strings';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly LAYOUT_STRINGS = LAYOUT_TEXTS;
}
