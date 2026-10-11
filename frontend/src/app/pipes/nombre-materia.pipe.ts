import { Pipe, PipeTransform } from '@angular/core';
import { presentarNombreMateriaPorCodigo, presentarNombreMateria } from '../utils/text.utils';

@Pipe({
  name: 'nombreMateria',
  standalone: true,
  pure: true,
})
export class NombreMateriaPipe implements PipeTransform {
  transform(
    nombre: string,
    codigo?: string,
    traducciones?: Readonly<Record<string, string>>
  ): string {
    return codigo && traducciones
      ? presentarNombreMateriaPorCodigo(codigo, nombre, traducciones)
      : presentarNombreMateria(nombre);
  }
}
