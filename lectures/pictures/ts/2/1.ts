abstract class Animal {
    constructor(public name: string) {
    }

    abstract makeSound(): void;

    public move(): void {
        console.log(this.name + " moved");
    }
}
