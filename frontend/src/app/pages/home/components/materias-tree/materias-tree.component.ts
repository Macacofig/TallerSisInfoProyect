import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MateriaTree, MATERIAS_TREE } from '../../../../data/materias-tree.data';

interface PositionedMateria extends MateriaTree {
  nivel: number;
  x: number;
  y: number;
}

interface TreeConnection {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromSigla: string;
  toSigla: string;
}

interface TreeLayout {
  height: number;
  levels: number;
  width: number;
  nodes: PositionedMateria[];
  connections: TreeConnection[];
}

@Component({
  selector: 'app-materias-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materias-tree.component.html',
  styleUrl: './materias-tree.component.scss',
})
export class MateriasTreeComponent {
  private readonly cardWidth = 192;
  private readonly cardHeight = 104;
  private readonly columnGap = 28;
  private readonly rowGap = 86;

  readonly materias = MATERIAS_TREE;
  readonly selectedSigla = signal<string | null>(null);
  readonly zoom = signal(1);
  readonly layout = this.createLayout();
  readonly scaledWidth = computed(() => this.layout.width * this.zoom());
  readonly scaledHeight = computed(() => this.layout.height * this.zoom());

  selectMateria(sigla: string): void {
    this.selectedSigla.update((selected) => selected === sigla ? null : sigla);
  }

  clearSelection(): void {
    this.selectedSigla.set(null);
  }

  zoomIn(): void {
    this.zoom.update((value) => Math.min(1.35, Number((value + 0.1).toFixed(2))));
  }

  zoomOut(): void {
    this.zoom.update((value) => Math.max(0.7, Number((value - 0.1).toFixed(2))));
  }

  resetZoom(): void {
    this.zoom.set(1);
  }

  isNodeHighlighted(node: PositionedMateria): boolean {
    const selected = this.selectedSigla();
    if (!selected) {
      return true;
    }

    const selectedMateria = this.materias.find((materia) => materia.sigla === selected);
    return node.sigla === selected
      || node.prerrequisitos.includes(selected)
      || Boolean(selectedMateria?.prerrequisitos.includes(node.sigla));
  }

  isConnectionHighlighted(connection: TreeConnection): boolean {
    const selected = this.selectedSigla();
    return Boolean(selected)
      && (connection.fromSigla === selected
      || connection.toSigla === selected);
  }

  trackBySigla(_: number, materia: PositionedMateria): string {
    return materia.sigla;
  }

  private createLayout(): TreeLayout {
    const materiaBySigla = new Map(this.materias.map((materia) => [materia.sigla, materia]));
    const levelCache = new Map<string, number>();
    const resolving = new Set<string>();

    const getLevel = (sigla: string): number => {
      const cachedLevel = levelCache.get(sigla);
      if (cachedLevel !== undefined) {
        return cachedLevel;
      }

      if (resolving.has(sigla)) {
        return 0;
      }

      const materia = materiaBySigla.get(sigla);
      if (!materia || materia.prerrequisitos.length === 0) {
        levelCache.set(sigla, 0);
        return 0;
      }

      resolving.add(sigla);
      const level = 1 + Math.max(...materia.prerrequisitos.map(getLevel));
      resolving.delete(sigla);
      levelCache.set(sigla, level);
      return level;
    };

    const nodesByLevel = new Map<number, MateriaTree[]>();
    this.materias.forEach((materia) => {
      const level = getLevel(materia.sigla);
      const levelNodes = nodesByLevel.get(level) ?? [];
      levelNodes.push(materia);
      nodesByLevel.set(level, levelNodes);
    });

    const levels = Math.max(...nodesByLevel.keys()) + 1;
    const maxNodesInLevel = Math.max(...Array.from(nodesByLevel.values(), (nodes) => nodes.length));
    const width = Math.max(980, maxNodesInLevel * (this.cardWidth + this.columnGap) + 96);
    const height = levels * (this.cardHeight + this.rowGap) + 36;
    const positionedNodes: PositionedMateria[] = [];
    const nodesBySigla = new Map<string, PositionedMateria>();

    nodesByLevel.forEach((levelNodes, level) => {
      const levelWidth = levelNodes.length * this.cardWidth + (levelNodes.length - 1) * this.columnGap;
      const startX = (width - levelWidth) / 2;
      levelNodes.forEach((materia, index) => {
        const node: PositionedMateria = {
          ...materia,
          nivel: level,
          x: startX + index * (this.cardWidth + this.columnGap),
          y: 18 + level * (this.cardHeight + this.rowGap),
        };
        positionedNodes.push(node);
        nodesBySigla.set(node.sigla, node);
      });
    });

    const connections: TreeConnection[] = [];
    positionedNodes.forEach((node) => {
      node.prerrequisitos.forEach((prerequisite) => {
        const prerequisiteNode = nodesBySigla.get(prerequisite);
        if (!prerequisiteNode) {
          return;
        }

        connections.push({
          fromX: prerequisiteNode.x + this.cardWidth / 2,
          fromY: prerequisiteNode.y + this.cardHeight,
          toX: node.x + this.cardWidth / 2,
          toY: node.y,
          fromSigla: prerequisite,
          toSigla: node.sigla,
        });
      });
    });

    return { height, levels, width, nodes: positionedNodes, connections };
  }
}
