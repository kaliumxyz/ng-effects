import { Host, Inject, Injectable, Injector } from "@angular/core"
import { HOST_INITIALIZER } from "../constants"
import { currentContext } from "./constants"

@Injectable()
export class ConnectFactory {
    constructor(@Host() @Inject(HOST_INITIALIZER) initializers: any[], @Host() injector: Injector) {
        return function connect(context: any) {
            currentContext.add(context)
            initializers.forEach(injector.get, injector)
            currentContext.clear()
        }
    }
}
