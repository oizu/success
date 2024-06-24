import {WebGLRenderer} from "three";

export class XRButton {
  public element: HTMLButtonElement;
  public renderer?: WebGLRenderer;
  public params?: XRSessionInit;
  public session?: XRSession;
  public system: XRSystem;

  constructor(renderer: WebGLRenderer, system: XRSystem) {
    this.element = document.createElement('button');
    this.renderer = renderer;
    this.system = system;
  }

  private async onSessionStarted(session: XRSession) {
    session.addEventListener('end', this.onSessionEnded);
    await this.renderer?.xr.setSession(session);
    this.element.textContent = 'STOP XR';
    this.session = session;
  }

  private onSessionEnded( /*event*/) {
    this.element.removeEventListener('end', this.onSessionEnded);
    this.element.textContent = 'START XR';
  }

  public showStartXR(mode: XRSessionMode) {
    this.element.style.display = '';
    this.element.style.cursor = 'pointer';
    this.element.style.left = 'calc(50% - 50px)';
    this.element.style.width = '100px';
    this.element.textContent = 'START XR';

    const that = this;

    const options: XRSessionInit = {
      optionalFeatures: ['local-floor', 'bounded-floor', 'layers',],
      requiredFeatures: []
    };

    this.element.onmouseenter = function () {
      that.element.style.opacity = '1.0';
    };

    this.element.onmouseleave = function () {
      that.element.style.opacity = '0.5';
    };

    this.element.onclick = function () {
      that.system.requestSession(mode, options).then(that.onSessionStarted);
    }
  }

  public disableButton() {
    this.element.style.display = '';
    this.element.style.cursor = 'auto';
    this.element.style.left = 'calc(50% - 75px)';
    this.element.style.width = '150px';

    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.onclick = null;

  }

  public showXRNotSupported() {
    this.disableButton();
    this.element.textContent = 'XR NOT SUPPORTED';
  }

  private showXRNotAllowed(exception: any) {
    this.disableButton();
    console.warn('Exception when trying to call xr.isSessionSupported', exception);
    this.element.textContent = 'XR NOT ALLOWED';
  }

  private stylizeElement() {
    this.element.style.position = 'absolute';
    this.element.style.bottom = '20px';
    this.element.style.padding = '12px 6px';
    this.element.style.border = '1px solid #fff';
    this.element.style.borderRadius = '4px';
    this.element.style.background = 'rgba(0,0,0,0.1)';
    this.element.style.color = '#fff';
    this.element.style.font = 'normal 13px sans-serif';
    this.element.style.textAlign = 'center';
    this.element.style.opacity = '0.5';
    this.element.style.outline = 'none';
    this.element.style.zIndex = '999';
  }

  static createButton(renderer: WebGLRenderer, system: XRSystem, params?: XRSessionInit) {
    const result = new XRButton(renderer, system);
    result.params = params ? params : result.params;

    result.element.id = 'XRButton';
    result.element.style.display = 'none';
    result.stylizeElement();
    const mode = 'inline';
    result.system.isSessionSupported(mode)
      .then(function (supported) {
        if (supported) {
          result.showStartXR(mode);
        } else {
          result.system.isSessionSupported(mode)
            .then(function (supported) {
              if (supported) {
                result.showStartXR(mode);
              } else {
                result.showXRNotSupported();
              }
            }).catch(result.showXRNotAllowed);
        }
      }).catch(result.showXRNotAllowed);

    return result;
  }
}
