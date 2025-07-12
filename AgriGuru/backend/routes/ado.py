from flask import Blueprint, jsonify, request
from models.ado import ADO
from app import db
from math import radians, sin, cos, sqrt, atan2

ado_bp = Blueprint('ado', __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in kilometers

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance

@ado_bp.route('/api/ados', methods=['GET'])
def get_all_ados():
    try:
        ados = ADO.query.all()
        return jsonify([ado.to_dict() for ado in ados])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ado_bp.route('/api/ados/nearby', methods=['GET'])
def get_nearby_ados():
    try:
        # Get user's location from query parameters
        user_lat = float(request.args.get('lat'))
        user_lng = float(request.args.get('lng'))
        
        # Get maximum distance (optional, default 50km)
        max_distance = float(request.args.get('distance', 50))
        
        # Get all ADOs
        all_ados = ADO.query.all()
        
        # Filter and sort ADOs by distance
        nearby_ados = []
        for ado in all_ados:
            distance = calculate_distance(
                user_lat, user_lng,
                ado.latitude, ado.longitude
            )
            if distance <= max_distance:
                ado_dict = ado.to_dict()
                ado_dict['distance'] = round(distance, 2)
                nearby_ados.append(ado_dict)
        
        # Sort by distance
        nearby_ados.sort(key=lambda x: x['distance'])
        
        return jsonify(nearby_ados)
    except ValueError:
        return jsonify({'error': 'Invalid coordinates provided'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin routes for managing ADOs
@ado_bp.route('/api/ados', methods=['POST'])
def create_ado():
    try:
        data = request.json
        new_ado = ADO(
            name=data['name'],
            designation=data['designation'],
            district=data['district'],
            office=data['office'],
            phone=data['phone'],
            email=data['email'],
            address=data['address'],
            specialization=data['specialization'],
            latitude=data['location']['latitude'],
            longitude=data['location']['longitude']
        )
        db.session.add(new_ado)
        db.session.commit()
        return jsonify(new_ado.to_dict()), 201
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ado_bp.route('/api/ados/<int:ado_id>', methods=['PUT'])
def update_ado(ado_id):
    try:
        ado = ADO.query.get_or_404(ado_id)
        data = request.json
        
        ado.name = data.get('name', ado.name)
        ado.designation = data.get('designation', ado.designation)
        ado.district = data.get('district', ado.district)
        ado.office = data.get('office', ado.office)
        ado.phone = data.get('phone', ado.phone)
        ado.email = data.get('email', ado.email)
        ado.address = data.get('address', ado.address)
        ado.specialization = data.get('specialization', ado.specialization)
        
        if 'location' in data:
            ado.latitude = data['location'].get('latitude', ado.latitude)
            ado.longitude = data['location'].get('longitude', ado.longitude)
        
        db.session.commit()
        return jsonify(ado.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ado_bp.route('/api/ados/<int:ado_id>', methods=['DELETE'])
def delete_ado(ado_id):
    try:
        ado = ADO.query.get_or_404(ado_id)
        db.session.delete(ado)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
