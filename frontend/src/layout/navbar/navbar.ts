import { Component } from '@angular/core';
import { NAVBAR_MESSAGES } from '../../app/strings/layout/navbar.messages';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly NAVBAR_MESSAGES = NAVBAR_MESSAGES;
}
