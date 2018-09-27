import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChildren, ElementRef, Input, OnInit,
    QueryList, ViewChild
} from '@angular/core';
import {UiTabComponent} from '../tab.component';
import {UiTabHeaderComponent} from '../header/tab-header.component';

@Component({
    selector: 'ui-tab-group',
    templateUrl: './tab-group.component.html',
    styleUrls: ['./tab-group.component.scss']
})
export class UiTabGroupComponent implements OnInit, AfterViewInit {
    @ContentChildren(UiTabComponent) tabsQueryList: QueryList<UiTabComponent>;
    @ViewChild(UiTabHeaderComponent) tabHeader: UiTabHeaderComponent;
    @Input() active: number;
    @Input() fillBackground: boolean;
    @Input() themeInkBar: boolean;
    @Input() accent: boolean;

    tabs: any[];
    activatedTab: UiTabComponent;

    constructor(private changeDetectorRef: ChangeDetectorRef, private element: ElementRef) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        // Transformando a QueryList em um array de component(UiTabComponent)
        this.tabs = this.tabsQueryList.toArray();
        this.changeDetectorRef.detectChanges();
        this.generateIndexes();

        // Ativa uma tab através do index passado com Input ou a primeira tab
        const tab = this.getFirstTab(this.active);
        this.activateTab(tab, this.getTabRef(tab));

        this.tabsQueryList.changes.subscribe(newTabs => {
            this.tabs = newTabs.toArray();
            this.generateIndexes();

            // Verificando se a tab selecionada foi removida da lista
            if (!this.tabs.includes(this.activatedTab)) {
                // Ativando a tab que ficou no mesmo index da última tab ativa
                const newTab = this.tabs[this.activatedTab.index] || this.tabs[this.tabs.length - 1];
                this.activateTab(newTab, this.getTabRef(tab));
            }
        });
    }

    /**
     * Atribuí os index para as tabs
     * @return {void}
     **/
    generateIndexes() {
        this.tabs.map((tab, index) => tab.index = index);
    }

    /**
     * Retorna a primeira tab que não está desabilitada
     * @param {number} tabIndex - Index da tab a ser procurada primeiro
     * @return {UiTabComponent}
    **/
    getFirstTab (tabIndex) {
        if (typeof tabIndex === 'number' && !this.tabs[tabIndex].disabled) {
            return this.tabs[tabIndex];
        }

        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            if (!tab.disabled) {
                return tab;
            }
        }
    }

    /**
     * Retorna a refencia da tab em HTML
     * @param {UiTabComponent} tab - Class da tab a ser encontrada
     * @return {void}
    **/
    getTabRef (tab) {
        const tabsRef = this.element.nativeElement.querySelectorAll('.tab');
        return tabsRef ? tabsRef[tab.index] : null;
    }

    /**
     * Ativa uma tab
     * @param tab {UiTabComponent} - Tab a ser ativada
     * @param tabRef {HTMLElement} - Referencia da tab em um elemento HTML
     * @return {void}
     * */
    activateTab(tab: UiTabComponent, tabRef: HTMLElement) {
        if (tab.disabled) {
            return;
        }

        if (this.activatedTab) {
            this.activatedTab.tabChange.emit(false);
        }

        tab.tabChange.emit(true);
        this.changeDetectorRef.detectChanges();

        this.activatedTab = tab;

        this.tabHeader.moveInkBarTo(tabRef);
        this.updateActivatedTab();
    }

    /**
     * Altera em todos components(UiTabComponent) o index da nova tab ativada
     * @return {void}
     **/
    updateActivatedTab() {
        this.tabs.map(tab => tab.indexActivatedTab = this.activatedTab.index);
    }
}
