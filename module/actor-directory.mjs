export class ActorDirectoryBoB extends ActorDirectory {
    static entryPartial = "systems/band-of-blades/templates/ui/sidebar/actor-document-partial.hbs";

    constructor(...args) {
        super(...args);
    }

    /** @override */
    async _onClickEntryName(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const parentElement = element.closest(".directory-item.document.actor");
        const documentId = parentElement.dataset.documentId;
        const document = this.collection.get(documentId) ?? await this.collection.getDocument(documentId);
        document.sheet.render(true);
    }

    // Override the render method to use the custom actor template
    render(force, context = {}) {
        // You can customize how actors are rendered in the directory here
        super.render(force, context);
    }

    async getData() {
        return super.getData();
    }
}