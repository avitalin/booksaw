from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Book, Category, Author
from app import db

bp = Blueprint('books', __name__)

@bp.route('/books', methods=['GET'])
def get_books():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int)
    category = request.args.get('category')
    query = request.args.get('query')
    
    books_query = Book.query
    
    if category:
        books_query = books_query.join(Book.category).filter(Category.slug == category)
    
    if query:
        books_query = books_query.filter(
            db.or_(
                Book.title.ilike(f'%{query}%'),
                Book.description.ilike(f'%{query}%')
            )
        )
    
    pagination = books_query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'books': [{
            'id': book.id,
            'title': book.title,
            'isbn': book.isbn,
            'price': float(book.price),
            'cover_image_url': book.cover_image_url,
            'category': book.category.name if book.category else None,
            'authors': [author.name for author in book.authors]
        } for book in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@bp.route('/books/<int:id>', methods=['GET'])
def get_book(id):
    book = Book.query.get_or_404(id)
    return jsonify({
        'id': book.id,
        'title': book.title,
        'isbn': book.isbn,
        'description': book.description,
        'price': float(book.price),
        'stock_quantity': book.stock_quantity,
        'cover_image_url': book.cover_image_url,
        'published_date': book.published_date.isoformat() if book.published_date else None,
        'publisher': book.publisher,
        'category': book.category.name if book.category else None,
        'authors': [author.name for author in book.authors]
    })

@bp.route('/books', methods=['POST'])
@jwt_required()
def create_book():
    data = request.get_json()
    
    book = Book(
        title=data['title'],
        isbn=data['isbn'],
        description=data.get('description'),
        price=data['price'],
        stock_quantity=data.get('stockQuantity', 0),
        cover_image_url=data.get('coverImageUrl'),
        published_date=data.get('publishedDate'),
        publisher=data.get('publisher'),
        category_id=data.get('categoryId')
    )
    
    if 'authorIds' in data:
        authors = Author.query.filter(Author.id.in_(data['authorIds'])).all()
        book.authors = authors
    
    db.session.add(book)
    db.session.commit()
    
    return jsonify({'id': book.id}), 201 