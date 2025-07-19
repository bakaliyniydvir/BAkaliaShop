import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

const MIN_DELAY = 200
const MAX_WAIT = 2000

export default function CategoryCard({ category, index = 0 }) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [showName, setShowName] = useState(false)

    const to = `/category/${category.slug}`

    const fallbackTimeout = useRef(null)
    const showNameTimeout = useRef(null)
    const loadStart = useRef(null)

    useEffect(() => {
        setIsLoaded(false)
        setImgError(false)
        setShowName(false)
        loadStart.current = Date.now()

        // Safety fallback — show image anyway if nothing triggers
        fallbackTimeout.current = setTimeout(() => {
            setIsLoaded(true)
        }, MAX_WAIT)

        return () => {
            clearTimeout(fallbackTimeout.current)
            clearTimeout(showNameTimeout.current)
        }
    }, [category.image])

    const handleLoad = () => {
        clearTimeout(fallbackTimeout.current)
        const elapsed = Date.now() - loadStart.current
        const delay = Math.max(0, MIN_DELAY - elapsed)

        setTimeout(() => {
            setIsLoaded(true)
        }, delay)
    }

    const handleError = () => {
        clearTimeout(fallbackTimeout.current)
        setImgError(true)
        showNameTimeout.current = setTimeout(() => {
            setShowName(true)
        }, 300)
    }

    return (
        <NavLink
            to={to}
            className="block rounded-xl overflow-hidden group transform transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30 bg-primary"
        >
            <div className="relative w-full aspect-square">
                {/* Skeleton shimmer */}
                {!isLoaded && !imgError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-product_primary/20 via-product_primary/10 to-product_primary/20 bg-[length:200%_100%] animate-shimmer z-0" />
                )}

                {/* Image */}
                {!imgError && (
                    <img
                        src={category.image}
                        alt={category.name}
                        loading={index < 6 ? 'eager' : 'lazy'}
                        onLoad={handleLoad}
                        onError={handleError}
                        className={`
          absolute inset-0 w-full h-full object-cover
          transition-all duration-500 ease-out
          ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
        `}
                    />
                )}

                {/* Назва по центру внизу */}
                <div className="absolute bottom-2 left-0 w-full text-center z-10 px-2">
                    <span className="inline-block text-sm font-semibold text-white px-2 py-0.5 rounded drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                        {category.name}
                    </span>
                </div>
            </div>
        </NavLink>
    )
}
