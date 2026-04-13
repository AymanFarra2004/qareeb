export default function aPITest() {
    async function getHubs() {
        const response = await fetch("https://karam.idreis.net/api/v1/front/hubs/first-hub");
        const data = await response.json();
        console.log("offers: ",data.offers);
    }
    getHubs();
    return null;
}