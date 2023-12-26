export default function ChatIcon({ color }: { color: string }) {
    return (
        <svg
            fill={color}
            width="1.5rem"
            height="1.5rem"
            viewBox="0 0 1920 1920"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M677.68-.034v338.937h112.942V113.02h1016.47v790.476h-225.995v259.764l-259.651-259.764h-79.172V451.844H.034v1016.47h338.71v418.9l417.996-418.9h485.534v-451.877h32.753l419.125 419.124v-419.124h225.882V-.033H677.68ZM338.825 903.53H903.53V790.59H338.824v112.94Zm0 225.883H677.76v-113.054H338.824v113.054Zm-225.849-564.74h1016.47v790.701H710.435l-258.748 259.652v-259.652h-338.71V564.672Z"
                fillRule="evenodd"
            />
        </svg>
    );
}
