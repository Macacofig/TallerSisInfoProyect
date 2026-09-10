import { Component } from '@angular/core';
import { LAYOUT_STRINGS as LAYOUT_TEXTS } from '../../app/strings/layout.strings';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly LAYOUT_STRINGS = LAYOUT_TEXTS;
}
