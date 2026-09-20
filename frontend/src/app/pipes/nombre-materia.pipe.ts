import { Pipe, PipeTransform } from '@angular/core';
import { presentarNombreMateria } from '../utils/text.utils';

@Pipe({
  name: 'nombreMateria',
  standalone: true,
  pure: true,
})
export class NombreMateriaPipe implements PipeTransform {
  transform(nombre: string): string {
    return presentarNombreMateria(nombre);
  }
}
