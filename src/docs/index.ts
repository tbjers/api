import 'bootstrap/dist/css/bootstrap.min.css';
import { autobind } from 'core-decorators';
import * as DOMPurify from 'dompurify';
import 'es6-shim';
import * as marked from 'marked';
import * as SmoothScroll from 'smooth-scroll';
import 'typeface-roboto-condensed';
import 'whatwg-fetch';
import { IGetInfoResponse } from '../services/info.service';

// API home page and documentation
class DocsPage {
  // Initialises the page once DOM is ready
  @autobind
  public async init(): Promise<void> {
    // Enable resonsive menu
    this.enableMenu();

    // Check service status
    this.checkStatus();

    // Enable smooth scrolling of page links
    const scroll = new SmoothScroll('a[href*="#"]', {
      updateURL: false
    });
  }

  private async checkStatus() {
    const versionEl = document.querySelector('#version');
    const currentStatusEl = document.querySelector('#currentstatus');
    const serverMessageEl = document.querySelector('#servermessage');

    // Display current status and version for this xBrowserSync service
    try {
      const response = await fetch(`${location.pathname}info`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const apiInfo: IGetInfoResponse = await response.json();
      if (apiInfo) {
        versionEl.textContent = apiInfo.version;

        // If the server has configured a message, display it
        if (apiInfo.message) {
          serverMessageEl.innerHTML = DOMPurify.sanitize(marked(apiInfo.message));
          serverMessageEl.className = 'd-block';
        }
      }

      switch (apiInfo.status) {
        case 1:
          currentStatusEl.textContent = 'Online';
          currentStatusEl.className = 'text-success';
          break;
        case 3:
          currentStatusEl.textContent = 'Not accepting new syncs';
          currentStatusEl.className = 'text-warning';
          break;
        default:
        case 2:
          currentStatusEl.textContent = 'Offline';
          currentStatusEl.className = 'text-danger';
          break;
      }
    }
    catch (err) {
      currentStatusEl.textContent = 'Offline';
      currentStatusEl.className = 'text-danger';
      console.error(err);
    }
  }

  private enableMenu() {
    const toggle = document.querySelector<HTMLButtonElement>('.nav-menu-button');
    const navbar = document.querySelector('nav');

    const toggleMenu = () => {
      // Toggle menu display and menu button hide
      if (navbar.classList.contains('open')) {
        navbar.classList.remove('open');
        toggle.classList.remove('hide');
        document.body.classList.remove('noscroll');
      }
      else {
        navbar.classList.add('open');
        toggle.classList.add('hide');
        document.body.classList.add('noscroll');
      }
    };

    // Enable menu button
    toggle.addEventListener('click', e => {
      toggleMenu();
    });

    // Hide menu when nav link is clicked
    const navbarLinks = navbar.querySelectorAll('a');
    Array.from(navbarLinks).forEach(link => {
      link.addEventListener('click', e => {
        toggleMenu();
      });
    });
  }
}

const docsPage = new DocsPage();
document.addEventListener('DOMContentLoaded', docsPage.init);