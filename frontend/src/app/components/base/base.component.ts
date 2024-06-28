export class BaseComponent {
  protected authenticated(): boolean {
    let stored = localStorage.getItem('current_user');
    return stored != null && JSON.parse(stored).jwt !== '';
  }
}
