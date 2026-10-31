import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MateriasTreeComponent } from './components/materias-tree/materias-tree.component';
import { HOME_MESSAGES } from '../../strings/home/home.messages';
import { FeatureToggleService, FEATURE_TOGGLE_STORAGE_KEYS } from '../../services/feature-toggle.service';

@Component({
  standalone: true,
  selector: 'app-materias-tree',
  template: '',
})
class MockMateriasTreeComponent {}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias);
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    })
      .overrideComponent(HomeComponent, {
        remove: {
          imports: [MateriasTreeComponent],
        },
        add: {
          imports: [MockMateriasTreeComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el título de la página desde los strings', () => {
    const title = fixture.nativeElement.querySelector('h1');

    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe(HOME_MESSAGES.CURRICULUM_TITLE);
  });

  it('muestra el componente de materias', () => {
    TestBed.inject(FeatureToggleService).setArbolMaterias(true);
    fixture.detectChanges();
    const materiasTree =
      fixture.nativeElement.querySelector('app-materias-tree');

    expect(materiasTree).toBeTruthy();
  });

  it('oculta el componente de materias con el flag desactivado', () => {
    TestBed.inject(FeatureToggleService).setArbolMaterias(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-materias-tree')).toBeNull();
  });
});
