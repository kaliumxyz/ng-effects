import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    Inject,
    Injectable,
    Injector,
    NO_ERRORS_SCHEMA,
    Provider,
    Type,
} from "@angular/core"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { Effect } from "../decorators"
import { Connect } from "../providers"
import { EffectOptions } from "../interfaces"
import fn = jest.fn

// noinspection AngularMissingOrInvalidDeclarationInModule
@Directive()
export class SimpleDirective {
    constructor(connect: Connect) {
        connect(this)
    }
}

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
    template: "",
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComponent {
    constructor(connect: Connect) {
        connect(this)
    }
    @Effect()
    public hostEffect() {}
}

export function createDirective(directive: Type<any>, deps?: any[], providers?: Provider[]) {
    void TestBed.configureTestingModule({
        providers: [
            {
                provide: directive,
                useClass: directive,
                deps,
            },
            {
                provide: ChangeDetectorRef,
                useValue: {
                    markForCheck: fn(),
                    detectChanges: fn(),
                },
            },
            {
                provide: ElementRef,
                useValue: {
                    nativeElement: document.createElement("div"),
                },
            },
            providers,
        ],
    }).compileComponents()
    return TestBed.inject(directive)
}

interface ComponentDef extends Partial<Component> {
    component: Type<any>
    deps?: any[]
    rootProviders?: Provider[]
    declarations?: Type<any>[]
    imports?: any[]
}

export function createComponent<T extends any = any>(def: ComponentDef): ComponentFixture<T> {
    // noinspection AngularMissingOrInvalidDeclarationInModule
    @Component({
        ...def,
        template: def.template || "",
    })
    class MockComponent {
        constructor(@Inject(Injector) injector: Injector) {
            const deps = (def.deps || []).map(token => injector.get(token))
            return new def.component(...deps)
        }
    }
    void TestBed.configureTestingModule({
        declarations: [MockComponent, ...(def.declarations ? def.declarations : [])],
        imports: def.imports || [],
        providers: def.rootProviders || [],
    }).compileComponents()
    return TestBed.createComponent(MockComponent as any)
}

export function createSimpleDirective(providers: Provider[]) {
    return TestBed.configureTestingModule({
        providers: [
            SimpleDirective,
            providers,
            {
                provide: ChangeDetectorRef,
                useClass: ChangeDetectorRef,
            },
            {
                provide: ElementRef,
                useValue: {
                    nativeElement: document.createElement("div"),
                },
            },
        ],
    }).inject(SimpleDirective)
}

export function createSimpleComponent(providers: Provider[]) {
    void TestBed.configureTestingModule({
        declarations: [SimpleComponent],
        schemas: [NO_ERRORS_SCHEMA],
    })
        .overrideComponent(SimpleComponent, {
            add: {
                providers,
            },
        })
        .compileComponents()
    return TestBed.createComponent(SimpleComponent)
}

export function createEffectsClass(options?: EffectOptions) {
    @Injectable()
    class VoidEffects {
        spy = fn()
        @Effect(options)
        effect() {
            this.spy()
        }
    }
    return VoidEffects
}