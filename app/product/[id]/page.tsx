export default function ProductPage({params: {id} }: {params:{id: string} }) {
    return (
        <div>
            <p>Product {id}</p>
        </div>
    );
}