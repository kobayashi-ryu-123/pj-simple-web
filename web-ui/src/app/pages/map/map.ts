import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  standalone: true,
  imports: [CommonModule]
})
export class MapComponent implements AfterViewInit {

  readonly RADIUS_M = 1000; // 半径（メートル）
  private L!: typeof import('leaflet');

  private map!: L.Map;
  private clusterGroup!: L.LayerGroup;
  private radiusCircle: L.Circle | null = null;

  markersData: any[] = [];
  markersMap = new globalThis.Map<string, L.Marker>();

  orderedList: any[] = [];
  currentIndex = 0;
  selectedItem: any = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      return;
    }

    const { loadLeaflet } = await import('./leaflet.loader');
    const L = await loadLeaflet();

    this.initLeafletIcon(L);
    this.initMap(L);
    this.loadMarkers(L);
  }

  private async initLeaflet(): Promise<typeof import('leaflet')> {
    const L = await import('leaflet');
    await import('leaflet.markercluster');
    return L;
  }

  /* マップ初期化 */
  initMap(L: typeof import('leaflet')): void {
    // 東京駅を中心にマップを生成
    this.map = L.map('map').setView([35.68, 139.76], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.clusterGroup = (L as any).markerClusterGroup();
  }

  /* マーカー読み込み */
  loadMarkers(L: typeof import('leaflet')): void {
    this.http.get<any[]>('assets/data.json').subscribe(data => {
      this.markersData = data;

      data.forEach(item => {
        const marker = L.marker([item.lat, item.lng]);

        marker.on('click', () => {
          this.selectBaseMarker(item);
        });

        this.markersMap.set(item.id, marker);
        this.clusterGroup.addLayer(marker);
      });

      this.map.addLayer(this.clusterGroup);
    });
  }

  /**
   * マーカーアイコンの初期化
   */
  private initLeafletIcon(L: typeof import('leaflet')): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }

  /* 基準マーカー選択 */
  selectBaseMarker(item: any): void {
    // 選択したマーカーから近い順にリストを生成
    this.buildOrderedList(item);
    // ページング対象のマーカーを囲む円
    this.drawRadiusCircle(this.L.latLng(item.lat, item.lng));
    // 先頭ページを表示
    this.moveToIndex(0);
  }

  /* 距離順＋半径フィルタ */
  buildOrderedList(baseItem: any): void {
    const baseLatLng = this.L.latLng(baseItem.lat, baseItem.lng);

    this.orderedList = this.markersData
      .map(item => {
        const distance = baseLatLng.distanceTo(
          this.L.latLng(item.lat, item.lng)
        );
        return { ...item, distance };
      })
      .filter(item => item.distance <= this.RADIUS_M)   // 半径[RADIUS_M]m以内のマーカーで絞り込み
      .sort((a, b) => a.distance - b.distance);         // 選択したマーカーに近い順でソート

    this.currentIndex = 0;
  }

  /* 半径円描画 */
  drawRadiusCircle(center: L.LatLng): void {
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
    }

    this.radiusCircle = this.L.circle(center, {
      radius: this.RADIUS_M,
      color: '#3388ff',
      weight: 2,
      fillOpacity: 0.15
    });

    this.radiusCircle.addTo(this.map);
  }

  /* インデックス移動（循環） */
  moveToIndex(index: number): void {
    const length = this.orderedList.length;
    if (length === 0) return;

    const normalizedIndex = (index + length) % length;

    this.currentIndex = normalizedIndex;
    this.selectedItem = this.orderedList[normalizedIndex];

    const marker = this.markersMap.get(this.selectedItem.id);
    if (marker) {
      this.map.setView(marker.getLatLng(), 14);
    }
  }

  next(): void {
    this.moveToIndex(this.currentIndex + 1);
  }

  prev(): void {
    this.moveToIndex(this.currentIndex - 1);
  }

  close(): void {
    this.orderedList = [];
    this.selectedItem = null;

    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
      this.radiusCircle = null;
    }
  }
}
