export class BaseComponent {
  protected authenticated(): boolean {
    if (typeof document !== 'undefined') {
      let stored = localStorage.getItem('current_user');
      return stored != null && JSON.parse(stored).jwt !== '';
    }
    return false;
  }
}
